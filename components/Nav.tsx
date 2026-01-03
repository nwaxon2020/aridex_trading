export default function Nav() {
    return (
        <div className="bg-blue-300">
            <div className="flex justify-between items-center z-80 px-8 py-3 bg-[rgba(0,0,0,0.7)]">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-white overflow-hidden">
                    <img
                        src={"/abidex_logo.jpeg"}
                        alt="Logo"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="text-right md:text-left text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Abidex
                    </h1>
                    <small className="text-right md:text-left text-[8px] md:text-xs text-gray-300 tracking-wide uppercase">
                        Your Best Property Trading Partner &reg;
                    </small>
                </div>

            </div>
        </div>
    );
}