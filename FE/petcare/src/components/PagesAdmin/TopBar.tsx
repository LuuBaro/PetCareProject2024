import { defaults } from "chart.js";
import React from "react";
import { Link } from "react-router-dom";

const TopBar = () => {
    return (
        <header className="bg-[#00B7C0] relative text-white flex items-center p-4 border-b border-gray-700">

            <div className="ml-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold">Thanh Phát</span>
                    <img
                        src="https://m.yodycdn.com/blog/anh-dai-dien-hai-yodyvn3-b3a8cf32-e08a-47fc-a741-71626aadc4de.jpg"
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                    />
                </div>
            </div>

        </header>
    );
};
export default TopBar
