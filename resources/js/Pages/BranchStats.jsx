import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function BranchStats({ branch, analysis }) {
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
        <AuthenticatedLayout
         
        >
            <Head title={`Analysis - ${branch}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500">
                                        Commit Frequency
                                    </h4>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {analysis.commit_frequency.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        commits per week
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500">
                                        Code Churn
                                    </h4>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {analysis.code_churn.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        lines changed per week
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-500">
                                        Files Analyzed
                                    </h4>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {analysis.summary.files_analyzed}
                                    </p>
                                </div>
                            </div>

                            {analysis.file_analyses && (
                                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-medium">
                                            Root Directory Files
                                        </h3>
                                        <select
                                            value={fileTypeFilter}
                                            onChange={(e) =>
                                                setFileTypeFilter(
                                                    e.target.value
                                                )
                                            }
                                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="all">
                                                All Files
                                            </option>
                                            {Object.keys(filesByType).map(
                                                (type) => (
                                                    <option
                                                        key={type}
                                                        value={type}
                                                    >
                                                        {type.toUpperCase()}{" "}
                                                        Files
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(filesByType)
                                            .filter(
                                                ([type]) =>
                                                    fileTypeFilter === "all" ||
                                                    type === fileTypeFilter
                                            )
                                            .map(([type, files]) => (
                                                <div
                                                    key={type}
                                                    className="border-t border-gray-200 pt-4 first:border-0 first:pt-0"
                                                >
                                                    <h4 className="text-sm font-medium text-gray-500 mb-3">
                                                        {type.toUpperCase()}{" "}
                                                        Files
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {files.map(
                                                            ({
                                                                filename,
                                                                analysis,
                                                            }) => (
                                                                <div
                                                                    key={
                                                                        filename
                                                                    }
                                                                    className="bg-gray-50 p-4 rounded-lg"
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h5 className="font-medium text-gray-900">
                                                                            {
                                                                                filename
                                                                            }
                                                                        </h5>
                                                                        <span className="text-sm text-gray-500">
                                                                            Score:{" "}
                                                                            {(
                                                                                (analysis.complexity_score +
                                                                                    analysis.quality_score) /
                                                                                2
                                                                            ).toFixed(
                                                                                1
                                                                            )}
                                                                            /10
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                Complexity
                                                                            </p>
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
                                                                                <span className="text-sm font-medium">
                                                                                    {
                                                                                        analysis.complexity_score
                                                                                    }
                                                                                    /10
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                Quality
                                                                            </p>
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
                                                                                <span className="text-sm font-medium">
                                                                                    {
                                                                                        analysis.quality_score
                                                                                    }
                                                                                    /10
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {analysis.suggestions &&
                                                                        analysis
                                                                            .suggestions
                                                                            .length >
                                                                            0 && (
                                                                            <div className="mt-2 text-sm">
                                                                                <p className="text-gray-500 mb-1">
                                                                                    Suggestions:
                                                                                </p>
                                                                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                                                                    {analysis.suggestions.map(
                                                                                        (
                                                                                            suggestion,
                                                                                            index
                                                                                        ) => (
                                                                                            <li
                                                                                                key={
                                                                                                    index
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    suggestion
                                                                                                }
                                                                                            </li>
                                                                                        )
                                                                                    )}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}