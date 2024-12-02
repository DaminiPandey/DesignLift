import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

const PRCard = ({ pr, onAnalyze }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
            <div className="flex items-center justify-between pt-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 text-zinc-300"
                        >
                            {pr.title}
                        </a>
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                        Opened by {pr.user.login} •{" "}
                        {new Date(pr.created_at).toLocaleDateString()}
                    </div>
                </div>
                <button
                    onClick={() => onAnalyze(pr.number)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Analyze PR
                </button>
            </div>
            {pr.analysis && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">
                                Code Quality Score
                            </h4>
                            <div className="mt-1 flex items-center">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-blue-600 rounded-full"
                                        style={{
                                            width: `${
                                                pr.analysis.quality_score * 10
                                            }%`,
                                        }}
                                    />
                                </div>
                                <span className="ml-2 text-sm font-medium">
                                    {pr.analysis.quality_score}/10
                                </span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">
                                Complexity Score
                            </h4>
                            <div className="mt-1 flex items-center">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-green-600 rounded-full"
                                        style={{
                                            width: `${
                                                pr.analysis.complexity_score *
                                                10
                                            }%`,
                                        }}
                                    />
                                </div>
                                <span className="ml-2 text-sm font-medium">
                                    {pr.analysis.complexity_score}/10
                                </span>
                            </div>
                        </div>
                    </div>
                    {pr.analysis.suggestions && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                                Suggestions
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                                {pr.analysis.suggestions.map(
                                    (suggestion, index) => (
                                        <li
                                            key={index}
                                            className="text-sm text-gray-600"
                                        >
                                            {suggestion}
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </CardContent>
    </Card>
);

export default function PRAnalysis() {
    const [prs, setPRs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPRs();
    }, []);

    const fetchPRs = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/pull-requests");
            setPRs(response.data);
        } catch (error) {
            setError("Failed to fetch pull requests");
            console.error("Error fetching PRs:", error);
        } finally {
            setLoading(false);
        }
    };

    const analyzePR = async (prNumber) => {
        try {
            const response = await axios.post(`/api/analyze-pr/${prNumber}`);
            setPRs(
                prs.map((pr) =>
                    pr.number === prNumber
                        ? { ...pr, analysis: response.data.analysis }
                        : pr
                )
            );
        } catch (error) {
            console.error("Error analyzing PR:", error);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <Head title="PR Analysis" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="PR Analysis" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-background-50 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6 text-white">
                                Pull Request Analysis
                            </h2>
                            {error ? (
                                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : prs.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No open pull requests found
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {prs.map((pr) => (
                                        <PRCard
                                            key={pr.number}
                                            pr={pr}
                                            onAnalyze={analyzePR}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
