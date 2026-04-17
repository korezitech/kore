import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" } // <-- ADDED THIS SO TYPESCRIPT KNOWS IT EXISTS
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Ask our Hostinger backend if the password is correct
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              twoFactorCode: credentials.twoFactorCode // <-- NOW SAFELY PASSED
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
          
          // If it fails (wrong password, or still pending), throw the error back to the UI
          throw new Error(data.error || "Login failed");
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  pages: {
    signIn: '/login', // Tell NextAuth where our custom login page is
  },
  callbacks: {
    // This saves the database role (admin/user) into the encrypted cookie
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    // This makes the role available to your React components
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