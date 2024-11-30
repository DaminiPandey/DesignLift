import React from "react";
import { motion } from "framer-motion";

export default function SummaryCards({ analysis }) {
    const cards = [
        {
            title: "Average Complexity",
            value: analysis?.summary?.average_complexity?.toFixed(2),
            icon: "⚡",
        },
        {
            title: "Average Quality",
            value: analysis?.summary?.average_quality?.toFixed(2),
            icon: "✨",
        },
        {
            title: "Files Analyzed",
            value: analysis?.summary?.files_analyzed,
            icon: "📊",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-6">
            {cards.map((card, index) => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    key={card.title}
                    className="bg-white rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out"
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <span className="text-4xl mb-2">{card.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-800">
                            {card.title}
                        </h3>
                        <p className="text-2xl font-bold text-indigo-600">
                            {card.value || ""}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
