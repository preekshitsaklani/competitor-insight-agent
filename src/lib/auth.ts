import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers"
import { db } from "@/db";
 
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {    
		enabled: true,
		sendResetPassword: async ({ user, url }, request) => {
			// Log for development - replace with actual email service in production
			console.log("Password reset requested for:", user.email);
			console.log("Reset URL:", url);
			
			// TODO: Integrate with email service (SendGrid, Resend, etc.)
			// Example with fetch to your email API:
			// await fetch('/api/send-email', {
			//   method: 'POST',
			//   body: JSON.stringify({
			//     to: user.email,
			//     subject: 'Reset Your Password',
			//     html: `Click here to reset: ${url}`
			//   })
			// });
		}
	},
	plugins: [bearer()]
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}