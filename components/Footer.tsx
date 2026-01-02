import Link from "next/link";

export default function FooterUi() {
    return (
        <footer className="relative border-t border-white/10 bg-gradient-to-t from-black/50 to-transparent">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-8 md:mb-0">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Abidex Trading Nigeria Ltd
                    </h3>
                    <p className="text-gray-400 mt-2">Redefining Luxury Living Worldwide</p>
                    
                    <div className="flex gap-4 mt-6">
                        <div className="text-center">
                        <div className="text-2xl font-bold text-blue-300">58+</div>
                        <div className="text-sm text-gray-400">Properties</div>
                        </div>
                        <div className="text-center">
                        <div className="text-2xl font-bold text-purple-300">13+</div>
                        <div className="text-sm text-gray-400">Years Experience</div>
                        </div>
                        <div className="text-center">
                        <div className="text-2xl font-bold text-pink-300">2</div>
                        <div className="text-sm text-gray-400">Continents</div>
                        </div>
                    </div>
                    </div>
                    
                    <div className="text-center md:text-right">
                    <p className="text-gray-400 text-sm mb-2">
                        © {new Date().getFullYear()} Abidex Trading Nigeria Ltd.
                    </p>
                    <p className="text-gray-500 text-xs">
                        Nigeria: Ikenne modern market, block F, shop8<br />
                        USA: 8145 S Cole St, Chicago, Illinois
                    </p>
                    </div>
                </div>
            </div>
            <div className="bg-black/70 border-t border-white/10">
                <nav className="flex justify-around items-center py-5 text-sm font-medium text-gray-300">
                    <Link href="/" className="hover:text-gray-500 transition">
                    Home
                    </Link>

                    <Link href="/blog" className="hover:text-gray-500 transition">
                    Blog
                    </Link>

                    <Link href="/about-us" className="hover:text-gray-500 transition">
                    About Us
                    </Link>

                    <Link href="/chat" className="hover:text-gray-500 transition">
                    Chat
                    </Link>
                </nav>
            </div>
        </footer>
    );
}