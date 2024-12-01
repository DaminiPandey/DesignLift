import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useSelector } from "react-redux";
import { ThreeDCards } from "@/Components/ThreeDCards";
import { TextGenerateEffect } from "@/Components/TextGenerateEffect";
import SummaryCards from "@/Components/SummaryCards";
import FileAnalysisCards from "@/Components/FileAnalysisCards";

const data = [
    ["Task", "Hours per Day"],
    ["Work", 9],
    ["Eat", 2],
    ["Commute", 2],
    ["Watch TV", 2],
    ["Sleep", 7],
];

const options = {
    title: "My Daily Activities",
};

export default function Metrics() {
    const { analysis } = useSelector((state) => state.analysis);
    console.log(analysis);

    return (
        <AuthenticatedLayout>
            <Head title="Repository Metrics" />

{analysis?
           ( <div className="py-12 w-full">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-background-50 shadow-sm sm:rounded-lg">
                        <div className="p-6 w-full">
                            <ThreeDCards analysis={analysis} />

                            {/* <TextGenerateEffect words="File Analysis" /> */}

                            {/* <p className="text-xl font-semibold mt-6">
                                File Analysis
                            </p> */}

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
