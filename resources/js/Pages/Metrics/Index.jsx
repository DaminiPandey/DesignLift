import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { CardContainer, CardBody, CardItem } from "../../Components/3dcard";
import { Chart } from "react-google-charts";
import ReactSpeedometer from "react-d3-speedometer";
import { useSelector } from "react-redux";
import { ThreeDCards } from "@/Components/ThreeDCards";
import { TextGenerateEffect } from "@/Components/TextGenerateEffect";
import { TextHoverEffect } from "@/Components/TextHoverEffect";

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
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 w-full">
                            <ThreeDCards analysis={analysis} />

                            <TextHoverEffect text="File Analysis" />
                            <CardContainer className="inter-var">
                                <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                                    <CardItem
                                        translateZ="50"
                                        className="text-xl font-bold text-neutral-600 dark:text-white"
                                    >
                                        Make things float in air
                                    </CardItem>
                                    <CardItem
                                        as="p"
                                        translateZ="60"
                                        className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                    >
                                        Hover over this card to unleash the
                                        power of CSS perspective
                                    </CardItem>
                                    <CardItem
                                        translateZ="100"
                                        className="w-full mt-4"
                                    >
                                        <Chart
                                            chartType="PieChart"
                                            data={data}
                                            options={options}
                                            width={"100%"}
                                            height={"400px"}
                                        />
                                    </CardItem>
                                    <div className="flex justify-between items-center mt-20">
                                        <CardItem
                                            translateZ={20}
                                            href="https://twitter.com/mannupaaji"
                                            target="__blank"
                                            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                                        >
                                            Try now →
                                        </CardItem>
                                        <CardItem
                                            translateZ={20}
                                            as="button"
                                            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                                        >
                                            Sign up
                                        </CardItem>
                                    </div>
                                </CardBody>
                            </CardContainer>
                        </div>
                    </div>
                </div>
            </div>):(<div className="flex  flex-1 flex-col">
                    <div className="mx-auto max-w-7xl sm:px-6 px-4 lg:px-8 w-full flex-1 flex flex-col">
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
                </div>)}
            {/* <ReactSpeedometer minValue={0} maxValue={10} value={5} /> */}
        </AuthenticatedLayout>
    );
}
