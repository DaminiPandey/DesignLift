import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import { TextGenerateEffect } from "../../Components/TextGenerateEffect";
import { useSelector, useDispatch } from "react-redux";
import { ThreeDCards } from "../../Components/ThreeDCards";

const words = `Oxygen gets you high. In a catastrophic emergency, we're taking giant, panicked breaths. Suddenly you become euphoric, docile. You accept your fate. It's all right here. Emergency water landing, six hundred miles an hour. Blank faces, calm as Hindu cows
`;

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
                        <div className="p-6 text-gray-900 w-full">
                            <ThreeDCards analysis={analysis} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
