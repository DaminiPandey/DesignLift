"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "./3d-card";

export function ThreeDCards({ analysis }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardContainer className="inter-var w-full">
                <CardBody className="w-full bg-black relative group/card dark:hover:shadow-2xl   border-0  h-auto rounded-xl p-6 hover:scale-105 transition-transform duration-300">
                    <CardItem
                        translateZ="100"
                        className="text-xl font-bold text-neutral-600 dark:text-white w-full"
                    >
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-5 h-5 text-blue-500 animate-pulse"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Commit Frequency</span>
                        </div>
                    </CardItem>
                    <CardItem
                        translateZ="60"
                        className="text-4xl  border-0 font-bold text-blue-500 mt-4 animate-in slide-in-from-bottom duration-1000"
                    >
                        {analysis?.commit_frequency || "0"}
                    </CardItem>
                    <CardItem
                        as="p"
                        translateZ="40"
                        className="text-neutral-500 dark:text-neutral-300 text-sm mt-2"
                    >
                        commits in the last 30 days
                    </CardItem>
                </CardBody>
            </CardContainer>

            <CardContainer className="inter-var w-full">
                <CardBody className="w-full  bg-black relative group/card dark:hover:shadow-2xl   border-0  h-auto rounded-xl p-6 hover:scale-105 transition-transform duration-300">
                    <CardItem
                        translateZ="100"
                        className="text-xl font-bold text-neutral-600 dark:text-white"
                    >
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-5 h-5 text-green-500 animate-bounce"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <span>Code Churn</span>
                        </div>
                    </CardItem>
                    <CardItem
                        translateZ="60"
                        className="flex space-x-4 mt-4 animate-in slide-in-from-bottom duration-1000"
                    >
                        <span className="text-3xl font-bold text-green-500">
                            {analysis?.code_churn}
                        </span>
                    </CardItem>
                    <CardItem
                        as="p"
                        translateZ="40"
                        className="text-neutral-500 dark:text-neutral-300 text-sm mt-2"
                    >
                        lines changed this week
                    </CardItem>
                </CardBody>
            </CardContainer>

            <CardContainer className="inter-var w-full">
                <CardBody className="w-full bg-black relative group/card dark:hover:shadow-2xl   border-0  h-auto rounded-xl p-6 hover:scale-105 transition-transform duration-300">
                    <CardItem
                        translateZ="100"
                        className="text-xl font-bold text-neutral-600 dark:text-white"
                    >
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-5 h-5 text-purple-500 animate-pulse"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Files Analyzed</span>
                        </div>
                    </CardItem>
                    <CardItem
                        translateZ="60"
                        className="text-4xl font-bold text-purple-500 mt-4 animate-in slide-in-from-bottom duration-1000"
                    >
                        {analysis.summary?.files_analyzed || "0"}
                    </CardItem>
                    <CardItem
                        as="p"
                        translateZ="40"
                        className="text-neutral-500 dark:text-neutral-300 text-sm mt-2"
                    >
                        total files scanned
                    </CardItem>
                </CardBody>
            </CardContainer>
        </div>
    );
}
