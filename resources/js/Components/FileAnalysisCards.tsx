import React from "react";
import { Chart } from "react-google-charts";
export default function FileAnalysisCards({ analysis }) {
    const data = [
        ["City", "2010 Population", "2000 Population"],
        ["New York City, NY", 8175000, 8008000],
        ["Los Angeles, CA", 3792000, 3694000],
        ["Chicago, IL", 2695000, 2896000],
        ["Houston, TX", 2099000, 1953000],
        ["Philadelphia, PA", 1526000, 1517000],
    ];
    const options = {
        title: "Population of Largest U.S. Cities",
        chartArea: { width: "50%" },
        hAxis: {
            title: "Total Population",
            minValue: 0,
        },
        vAxis: {
            title: "City",
        },
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {analysis?.file_analyses &&
                Object.entries(analysis.file_analyses).map(
                    ([filename, fileData]) => (
                        <div key={filename} className="inter-var">
                            <div className=" relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 shadow-md">
                                <div className="text-xl font-bold text-neutral-600 dark:text-white">
                                    {filename}
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <div className="text-neutral-600 dark:text-white">
                                        <span className="font-semibold">
                                            Complexity:
                                        </span>{" "}
                                        {fileData.complexity_score}
                                        <Chart
                                            chartType="BarChart"
                                            width="100%"
                                            height="100%"
                                            data={data}
                                            options={options}
                                            legendToggle
                                        />
                                    </div>
                                    <div className="text-neutral-600 dark:text-white">
                                        <span className="font-semibold">
                                            Quality:
                                        </span>{" "}
                                        {fileData.quality_score}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-neutral-600 dark:text-white">
                                        <span className="font-semibold">
                                            Suggestions:
                                        </span>
                                        <ul className="list-disc pl-4 mt-2">
                                            {fileData.suggestions.map(
                                                (suggestion, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-sm"
                                                    >
                                                        {suggestion}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
        </div>
    );
}
