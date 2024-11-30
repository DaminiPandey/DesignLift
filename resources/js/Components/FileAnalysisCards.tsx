import React from "react";

export default function FileAnalysisCards({ analysis }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis?.file_analyses &&
                Object.entries(analysis.file_analyses).map(
                    ([filename, fileData]) => (
                        <div key={filename} className="inter-var">
                            <div className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                                <div className="text-xl font-bold text-neutral-600 dark:text-white">
                                    {filename}
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <div className="text-neutral-600 dark:text-white">
                                        <span className="font-semibold">
                                            Complexity:
                                        </span>{" "}
                                        {fileData.complexity_score}
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
