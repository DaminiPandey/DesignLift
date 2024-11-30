import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux'
import { 
    setGithubUrl, 
    startAnalysis, 
    analysisSuccess, 
    analysisError 
} from '@/store/slices/analysisSlice'

export default function Dashboard() {
    const dispatch = useDispatch()
    const { githubUrl, loading, analysis, error } = useSelector((state) => state.analysis)

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(startAnalysis());

        try {
            const urlParts = githubUrl
                .replace("https://github.com/", "")
                .replace(".git", "")
                .split("/");

            if (urlParts.length !== 2) {
                throw new Error(
                    "Invalid GitHub URL format. Please use: https://github.com/owner/repository"
                );
            }

            const [owner, repo] = urlParts;
            const repoFullName = `${owner}/${repo}`;

            const response = await axios.post("/analyze", {
                repository_name: repoFullName,
            });

            dispatch(analysisSuccess(response.data.analysis));
            router.visit(route('metrics'));

        } catch (error) {
            dispatch(analysisError(error.response?.data?.message || error.message));
        }
    };

    return (
        <AuthenticatedLayout
        >
            <Head title="Repository Analysis" />

            <div className="py-12 w-full">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="githubUrl"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        GitHub Repository URL
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="githubUrl"
                                            id="githubUrl"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="https://github.com/owner/repository"
                                            value={githubUrl}
                                            onChange={(e) => dispatch(setGithubUrl(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Example:
                                        https://github.com/laravel/laravel
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                        loading
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    {loading
                                        ? "Analyzing..."
                                        : "Analyze Repository"}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-4 p-4 text-red-700 bg-red-100 rounded-md">
                                    {error}
                                </div>
                            )}

                            {analysis && (
                                <div className="mt-8 space-y-6">
                                    <h3 className="text-lg font-medium">
                                        Analysis Results
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Commit Frequency
                                            </h4>
                                            <p className="mt-1 text-2xl font-semibold">
                                                {analysis.commit_frequency.toFixed(
                                                    2
                                                )}
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
                                                {
                                                    analysis.summary
                                                        .files_analyzed
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {analysis.file_analyses &&
                                        Object.keys(analysis.file_analyses)
                                            .length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="text-lg font-medium mb-4">
                                                    File Analysis
                                                </h4>
                                                <div className="space-y-4">
                                                    {Object.entries(
                                                        analysis.file_analyses
                                                    ).map(
                                                        ([
                                                            filename,
                                                            fileAnalysis,
                                                        ]) => (
                                                            <div
                                                                key={filename}
                                                                className="bg-gray-50 p-4 rounded-lg"
                                                            >
                                                                <h5 className="font-medium">
                                                                    {filename}
                                                                </h5>
                                                                <div className="mt-2 grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Complexity
                                                                            Score
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {
                                                                                fileAnalysis.complexity_score
                                                                            }
                                                                            /10
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">
                                                                            Quality
                                                                            Score
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {
                                                                                fileAnalysis.quality_score
                                                                            }
                                                                            /10
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {fileAnalysis.suggestions && (
                                                                    <div className="mt-2">
                                                                        <p className="text-sm text-gray-500">
                                                                            Suggestions:
                                                                        </p>
                                                                        <ul className="mt-1 text-sm list-disc list-inside">
                                                                            {fileAnalysis.suggestions.map(
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
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
