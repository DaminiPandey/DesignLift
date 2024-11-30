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
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Repository Metrics
                </h2>
            }
        >
            <Head title="Repository Metrics" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
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
        </AuthenticatedLayout>
    );
}
