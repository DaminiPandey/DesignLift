import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/Components/ui/card";

const AnalysisModal = ({ analysis, onClose, contributorName }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background-50 rounded-lg w-full max-w-2xl mx-4 overflow-hidden shadow-xl transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-zinc-300">
                        Analysis for {contributorName}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-8 text-center">
                    <div className="relative inline-flex items-center justify-center">
                        <svg className="w-32 h-32">
                            <circle
                                className="text-gray-700"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="58"
                                cx="64"
                                cy="64"
                            />
                            <circle
                                className="text-blue-500"
                                strokeWidth="8"
                                strokeDasharray={360}
                                strokeDashoffset={360 - (360 * ((analysis.quality_score + analysis.impact_score + analysis.consistency_score) / 30) * 100) / 100}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="58"
                                cx="64"
                                cy="64"
                            />
                        </svg>
                        <span className="absolute text-2xl font-bold text-zinc-300">
                            {Math.round((analysis.quality_score + analysis.impact_score + analysis.consistency_score) / 30 * 100)}%
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Scores */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-background-100 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Quality</h4>
                            <div className="text-2xl font-bold text-blue-500">
                                {analysis.quality_score * 10}%
                            </div>
                        </div>
                        <div className="bg-background-100 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Impact</h4>
                            <div className="text-2xl font-bold text-green-500">
                                {analysis.impact_score * 10}%
                            </div>
                        </div>
                        <div className="bg-background-100 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Consistency</h4>
                            <div className="text-2xl font-bold text-purple-500">
                                {analysis.consistency_score * 10}%
                            </div>
                        </div>
                    </div>

                    {/* Improvements */}
                    <div className="bg-background-100 p-6 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-400 mb-4">Areas for Improvement</h4>
                        <div className="space-y-4">
                            {analysis.improvements?.map((improvement, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-start space-x-3 pb-3 last:pb-0 last:border-0"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                                        <svg 
                                            className="w-4 h-4 text-blue-500" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M13 10V3L4 14h7v7l9-11h-7z" 
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-sm font-medium text-zinc-300 mb-1">
                                            {improvement.title}
                                        </h5>
                                        <p className="text-sm text-gray-400">
                                            {improvement.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="bg-background-100 p-6 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Detailed Feedback</h4>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            {analysis.feedback}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ContributorCard = ({ contributor, onAnalyze }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        await onAnalyze(contributor.login);
        setIsAnalyzing(false);
        setShowModal(true);
    };

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 mt-4">
                    <div className="flex items-center space-x-4">
                        <img 
                            src={contributor.avatar_url} 
                            alt={contributor.login}
                            className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-zinc-300">
                                {contributor.login}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {contributor.contributions} contributions
                            </p>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 ${
                                isAnalyzing ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <span>Analyze</span>
                            )}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {showModal && contributor.analysis && (
                <AnalysisModal 
                    analysis={contributor.analysis}
                    contributorName={contributor.login}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};

export default function Contributors() {
    const [contributors, setContributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContributors();
    }, []);

    const fetchContributors = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/contributors");
            setContributors(response.data);
        } catch (error) {
            setError("Failed to fetch contributors");
            console.error("Error fetching contributors:", error);
        } finally {
            setLoading(false);
        }
    };

    const analyzeContributor = async (username) => {
        try {
            const response = await axios.post(
                `/api/analyze-contributor/${username}`
            );
            setContributors(
                contributors.map((contributor) =>
                    contributor.login === username
                        ? { ...contributor, analysis: response.data.analysis }
                        : contributor
                )
            );
        } catch (error) {
            console.error("Error analyzing contributor:", error);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Contributors" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-background-50 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6 text-white">
                                Repository Contributors
                            </h2>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : contributors.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No contributors found
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {contributors.map((contributor) => (
                                        <ContributorCard
                                            key={contributor.login}
                                            contributor={contributor}
                                            onAnalyze={analyzeContributor}
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
