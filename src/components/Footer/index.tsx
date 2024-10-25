// components/Footer.tsx
import { Phone, Mail, Github, Linkedin } from 'lucide-react';
import React from 'react';

const Footer = () => (
  <footer className="bg-[#000000] text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-bold mb-4">
            <span className="text-[#1C61E7]">KSP</span>
            <span className="text-[#21C15E]">Projects</span>
          </h3>
          <p className="text-gray-300">
            Empowering students with cutting-edge IoT and ML solutions for
            academic excellence.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <a href="#services" className="text-gray-300 hover:text-white">
                Services
              </a>
            </li>
            <li>
              <a href="#projects" className="text-gray-300 hover:text-white">
                Projects
              </a>
            </li>
            <li>
              <a href="#about" className="text-gray-300 hover:text-white">
                About Us
              </a>
            </li>
            <li>
              <a href="#contact" className="text-gray-300 hover:text-white">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* <div>
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <span>+91 9550421866</span>
            </li>
            <li className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>info@kspelectronics.in</span>
            </li>
          </ul>
        </div> */}

        <div>
  <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
  <ul className="space-y-2">
    <li>
      <a
        href="tel:+919550421866"
        className="flex items-center text-gray-300 hover:text-white transition-colors duration-300"
      >
        <Phone className="h-4 w-4 mr-2" />
        <span>+91 9550421866</span>
      </a>
    </li>
    <li>
      <a
        href="mailto:info@kspelectronics.in"
        className="flex items-center text-gray-300 hover:text-white transition-colors duration-300"
      >
        <Mail className="h-4 w-4 mr-2" />
        <span>info@kspelectronics.in</span>
      </a>
    </li>
  </ul>
</div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-300 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-300">
        <p>
          &copy; {new Date().getFullYear()} KSP Electronics. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;