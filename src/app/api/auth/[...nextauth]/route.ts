import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" } 
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // --- DEVICE & LOCATION CAPTURE ---
          const headers = req.headers || {};
          const userAgent = headers['user-agent'] || 'Unknown Device';
          const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || 'Unknown IP';
          
          // Leverage Vercel's built-in geo-headers
          const city = headers['x-vercel-ip-city'] || '';
          const country = headers['x-vercel-ip-country'] || '';
          const location = city && country ? `${city}, ${country}` : 'Unknown Location';

          // Simplify the User-Agent into a readable device name
          let deviceName = 'Unknown Device';
          if (userAgent.includes('Windows')) deviceName = 'Windows PC';
          else if (userAgent.includes('Macintosh')) deviceName = 'Mac';
          else if (userAgent.includes('iPhone')) deviceName = 'iPhone';
          else if (userAgent.includes('iPad')) deviceName = 'iPad';
          else if (userAgent.includes('Android')) deviceName = 'Android Device';
          else deviceName = userAgent.split(' ')[0]; // Fallback to raw browser string

          // Ask our Hostinger backend to authenticate
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              twoFactorCode: credentials.twoFactorCode,
              device: deviceName,
              ip: ip,
              location: location
            }),
            headers: { 
                "Content-Type": "application/json",
                "x-api-key": process.env.KORE_API_SECRET_KEY || ""
            }
          });

          const data = await res.json();

          // Catch the 2FA flag and throw it back to the frontend safely
          if (data.error === "2FA_REQUIRED") {
              throw new Error("2FA_REQUIRED");
          }

          // If the backend says Success, return the user data to create the session
          if (res.ok && data.user) {
            return data.user; 
          }
          
          // If it fails (wrong password, lockout, or pending), throw the exact PHP error back to the UI
          throw new Error(data.error || "Login failed");
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  pages: {
    signIn: '/login', 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  }
});

export { handler as GET, handler as POST };