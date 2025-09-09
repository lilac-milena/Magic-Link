import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthButton from "./auth-button";

export default async function HomePage() {
  const session = await auth();

  // If the user is already logged in, redirect them to the admin page.
  if (session) {
    redirect("/admin/create");
  }

  // Check which providers are enabled via environment variables
  const googleEnabled = !!(
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET
  );
  const azureEnabled = !!(
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER
  );

  // If not logged in, show the full-page login UI.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 animate-fade-in">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full shadow-lg button-hover animate-pulse-soft">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight gradient-text-animate">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Magic Link
            </span>
          </h1>

          <p className="text-lg text-gray-600 mt-4 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Secure authentication with multiple OAuth providers
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl card-hover animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
              <p className="text-gray-600">
                Please sign in with your account to continue
              </p>
            </div>

            <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <AuthButton googleEnabled={googleEnabled} azureEnabled={azureEnabled} />
            </div>

            <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="text-sm text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p>© {new Date().getFullYear()} Magic Link. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}
