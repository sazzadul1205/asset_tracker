import { FaGithub, FaRegCopyright } from 'react-icons/fa';
import { SiNextdotjs } from 'react-icons/si';


const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left - Version & Copyright */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SiNextdotjs className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">v1.0</span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              Alpha
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaRegCopyright className="w-3 h-3 mr-1" />
            <p>{new Date().getFullYear()} SAT • Version One of my Project</p>
            <p className='ml-2' >Made By <span className='font-semibold' >Sazzadul Islam Molla</span></p>
          </div>
        </div>

        {/* Right - GitHub Link */}
        <a
          href="https://github.com/sazzadul1205"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1 rounded-md transition-colors"
          title="View Project on GitHub"
        >
          <FaGithub className="w-4 h-4 mr-1.5" />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;