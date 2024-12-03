import React, { useState } from "react";
import { TextGenerateEffect } from "./TextGenerateEffect";

export default function FileAnalysisCards({ analysis }) {
    const [fileTypeFilter, setFileTypeFilter] = useState("all");

    const filesByType = analysis.file_analyses
        ? Object.entries(analysis.file_analyses).reduce(
              (acc, [filename, analysis]) => {
                  const ext =
                      filename.split(".").pop().toLowerCase() || "other";
                  if (!acc[ext]) acc[ext] = [];
                  acc[ext].push({ filename, analysis });
                  return acc;
              },
              {}
          )
        : {};
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.file_analyses && (
                <div className=" rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg text-white font-medium">
                            Root Directory Files
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(filesByType)
                            .filter(
                                ([type]) =>
                                    fileTypeFilter === "all" ||
                                    type === fileTypeFilter
                            )
                            .map(([type, files]) => (
                                <div key={type} className="mb-6">
                                    <div className="space-y-3">
                                        {files.map(({ filename, analysis }) => (
                                            <div
                                                key={filename}
                                                className="bg-background-100 p-4 rounded-lg mb-4"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="font-medium text-white">
                                                        {filename}
                                                    </h5>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6 mb-3">
                                                    <div className="flex-1 gap-3 flex flex-col">
                                                        <div className="flex items-center justify-between flex-1">
                                                            <p className="text-sm text-typography-900">
                                                                Complexity
                                                            </p>
                                                            <span className="text-sm font-medium text-typography-900">
                                                                {
                                                                    analysis.complexity_score
                                                                }
                                                                /10
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                                                                <div
                                                                    className="h-2 bg-blue-600 rounded-full"
                                                                    style={{
                                                                        width: `${
                                                                            analysis.complexity_score *
                                                                            10
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 gap-3 flex flex-col">
                                                        <div className="flex items-center justify-between flex-1">
                                                            <p className="text-sm text-typography-900">
                                                                Quality
                                                            </p>

                                                            <span className="text-sm font-medium text-typography-900">
                                                                {
                                                                    analysis.quality_score
                                                                }
                                                                /10
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                                                                <div
                                                                    className="h-2 bg-green-600 rounded-full"
                                                                    style={{
                                                                        width: `${
                                                                            analysis.quality_score *
                                                                            10
                                                                        }%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {analysis.suggestions &&
                                                    analysis.suggestions
                                                        .length > 0 && (
                                                        <div className="mt-2 text-sm">
                                                            <p className="text-typography-900 mb-1">
                                                                Suggestions:
                                                            </p>
                                                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                                                {analysis.suggestions.map(
                                                                    (
                                                                        suggestion,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="flex gap-2  items-center flex-row"
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="24"
                                                                                height="24"
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                stroke="#ffffff"
                                                                                strokeWidth="2"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                className="lucide lucide-dot"
                                                                            >
                                                                                <circle
                                                                                    cx="12.1"
                                                                                    cy="12.1"
                                                                                    r="1"
                                                                                />
                                                                            </svg>
                                                                            <TextGenerateEffect
                                                                                className="text-sm"
                                                                                words={
                                                                                    suggestion
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
