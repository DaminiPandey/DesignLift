import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ThreeDCards } from "@/Components/ThreeDCards";
import SummaryCards from "@/Components/SummaryCards";
import FileAnalysisCards from "@/Components/FileAnalysisCards";

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
        <AuthenticatedLayout>
            <Head title={`Analysis - ${branch}`} />

            {analysis ? (
                <div className="py-12 w-full">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-background-50 shadow-sm sm:rounded-lg">
                            <div className="p-6 w-full">
                                <ThreeDCards analysis={analysis} />

                                <SummaryCards analysis={analysis} />

                                <FileAnalysisCards analysis={analysis} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 flex-col bg-background-50">
                    <div className="mx-auto max-w-7xl sm:px-6 px-4 lg:px-8 w-full flex-1 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <h1 className="text-5xl font-semibold text-typography-950">
                                    Let’s get started with the code analysis! 🚀{" "}
                                </h1>
                                <p className="text-typography-500 text-xl">
                                    Please enter a valid git repo link!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
