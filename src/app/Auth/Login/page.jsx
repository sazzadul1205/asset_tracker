// Auth/Login
import Image from 'next/image';
import React from 'react';

import Logo from "../../../../public/Logo/Website_Logo.png"

const page = () => {
    return (
        <div >
            {/* Logo */}
            <div className="mx-auto pb-4 w-[300px]">
                <Image
                    src={Logo}
                    alt="SAT Logo"
                    className="w-full h-auto"
                    priority
                />
            </div>



        </div>
    );
};

export default page;