import { FaGithub, FaRegCopyright } from 'react-icons/fa';
import { SiNextdotjs } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-3 lg:px-6 lg:py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        {/* Left - Version & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Version Badge */}
          <div className="flex items-center gap-2">
            <SiNextdotjs className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">v1.1</span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              Alpha
            </span>
          </div>

          {/* Copyright & Credits */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <FaRegCopyright className="w-3 h-3 mr-1 shrink-0" />
              <span>{new Date().getFullYear()} SAT • Version One of my Project</span>
            </div>

            {/* Made By - Hidden on extra small screens, shown on sm and up */}
            <div className="hidden sm:flex items-center text-xs sm:text-sm text-gray-500">
              <span className="mx-1 sm:mx-2">•</span>
              <p>Made By <span className="font-semibold">Sazzadul Islam Molla</span></p>
            </div>
          </div>
        </div>

        {/* Made By - Only shown on xs screens */}
        <div className="sm:hidden text-xs text-gray-500 text-center">
          <p>Made By <span className="font-semibold">Sazzadul Islam Molla</span></p>
        </div>

        {/* Right - GitHub Link */}
        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <a
            href="https://github.com/sazzadul1205"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors w-fit"
            title="View Project on GitHub"
          >
            <FaGithub className="w-4 h-4 mr-1.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;