"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import Swal from "sweetalert2";

export const useRedirectIfAuthenticated = () => {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const session = await getSession();

            if (session) {
                // Show toast
                Swal.fire({
                    toast: true,
                    position: "top",
                    icon: "info",
                    title: "Already logged in",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    customClass: { popup: "mx-auto" },
                });

                // Redirect based on role
                const role = session.user.role || "Employee";
                switch (role) {
                    case "Admin":
                        router.replace("/Admin/Dashboard");
                        break;
                    case "Manager":
                        router.replace("/Manager/Dashboard");
                        break;
                    default:
                        router.replace("/Employee/Dashboard");
                }
            }
        };

        checkSession();
    }, [router]);
};
