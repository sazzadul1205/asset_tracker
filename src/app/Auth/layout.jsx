// Auth/Layout.js
"use client";

// Next Auth Components
import { SessionProvider } from "next-auth/react";

const Layout = ({ children }) => {
    return (
        <div className="bg-linear-to-tr from-gray-100 via-white to-gray-200 min-h-screen">
            {/* <Navbar /> */}
            <main className="flex items-center justify-center min-h-screen">
                <SessionProvider>{children}</SessionProvider>
            </main>
        </div>
    );
};

export default Layout;
