import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
    setGithubUrl,
    startAnalysis,
    analysisSuccess,
    analysisError,
} from "@/store/slices/analysisSlice";
import { Switch } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const DeepAnalysisStatus = ({ status }) => {
    const getStatusDisplay = () => {
        switch (status) {
            case 'queued':
                return {
                    color: 'text-yellow-700',
                    bgColor: 'bg-yellow-50',
                    message: 'Deep Analysis Queued',
                    description: 'Your analysis is in queue and will start soon.'
                };
            case 'processing':
                return {
                    color: 'text-blue-700',
                    bgColor: 'bg-blue-50',
                    message: 'Deep Analysis in Progress',
                    description: 'We are analyzing your repository in detail. This may take a few minutes.'
                };
            case 'completed':
                return {
                    color: 'text-green-700',
                    bgColor: 'bg-green-50',
                    message: 'Deep Analysis Completed',
                    description: 'Analysis is complete. Results will be displayed shortly.'
                };
            case 'failed':
                return {
                    color: 'text-red-700',
                    bgColor: 'bg-red-50',
                    message: 'Deep Analysis Failed',
                    description: 'There was an error during analysis. Please try again.'
                };
            default:
                return {
                    color: 'text-gray-700',
                    bgColor: 'bg-gray-50',
                    message: 'Initializing Deep Analysis',
                    description: 'Preparing to analyze your repository.'
                };
        }
    };

    const statusInfo = getStatusDisplay();

    return (
        <div className={`mt-6 p-4 rounded-lg ${statusInfo.bgColor}`}>
            <div className="flex items-center">
                {status === 'processing' && (
                    <div className="mr-3">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                <div>
                    <h3 className={`text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.message}
                    </h3>
                    <p className={`mt-1 text-sm ${statusInfo.color} opacity-75`}>
                        {statusInfo.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const dispatch = useDispatch();
    const { githubUrl, loading, analysis, error } = useSelector(
        (state) => state.analysis
    );
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branchAnalysis, setBranchAnalysis] = useState({});
    const [showBranches, setShowBranches] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [analyzingBranch, setAnalyzingBranch] = useState(null);
    const branchesPerPage = 10;
    const [isDeepAnalysis, setIsDeepAnalysis] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const progressInterval = useRef(null);
    const [deepAnalysisStatus, setDeepAnalysisStatus] = useState(null);
    const pollInterval = useRef(null);

    useEffect(() => {
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            if (pollInterval.current) {
                clearInterval(pollInterval.current);
            }
        };
    }, []);

    useEffect(() => {
        const fetchBranches = async () => {
            if (!githubUrl) return;

            try {
                const urlParts = githubUrl
                    .replace("https://github.com/", "")
                    .replace(".git", "")
                    .split("/");

                if (urlParts.length !== 2) return;

                const [owner, repo] = urlParts;
                const response = await axios.get(
                    `https://api.github.com/repos/${owner}/${repo}/branches`,
                    {
                        headers: {
                            Accept: "application/vnd.github.v3+json",
                        },
                    }
                );

                setBranches(response.data);
            } catch (error) {
                console.error("Failed to fetch branches:", error);
            }
        };

        fetchBranches();
    }, [githubUrl]);

    const analyzeBranch = async (branchName) => {
        setSelectedBranch(branchName);
        setAnalyzingBranch(branchName);
        try {
            const urlParts = githubUrl
                .replace("https://github.com/", "")
                .replace(".git", "")
                .split("/");

            const [owner, repo] = urlParts;
            const response = await axios.post("/analyze", {
                repository_name: `${owner}/${repo}`,
                branch: branchName,
            });

            setBranchAnalysis({
                ...branchAnalysis,
                [branchName]: response.data.analysis,
            });

            window.location.href = `/${branchName}/stats`;
        } catch (error) {
            console.error("Failed to analyze branch:", error);
            setAnalyzingBranch(null);
        }
    };

    const checkProgress = async (repoName) => {
        try {
            const response = await axios.get(`/analysis-progress/${repoName}`);
            const progress = response.data.progress;
            setAnalysisProgress(progress);

            if (progress >= 100) {
                clearInterval(progressInterval.current);
                setIsAnalyzing(false);
            }
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        }
    };

    const checkDeepAnalysisStatus = async (repoName) => {
        try {
            const response = await axios.get(`/deep-analysis-status/${repoName}`);
            const { status, result, error } = response.data;

            setDeepAnalysisStatus({ status });

            if (status === 'completed' && result) {
                clearInterval(pollInterval.current);
                setTimeout(() => {
                    dispatch(analysisSuccess(result));
                }, 1000);
            } else if (status === 'failed') {
                clearInterval(pollInterval.current);
                dispatch(analysisError(error || 'Deep analysis failed'));
            }
        } catch (error) {
            console.error('Failed to check deep analysis status:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(startAnalysis());

        try {
            const urlParts = githubUrl
                .replace("https://github.com/", "")
                .replace(".git", "")
                .split("/");

            const [owner, repo] = urlParts;
            const repoFullName = `${owner}/${repo}`;

            const response = await axios.post("/analyze", {
                repository_name: repoFullName,
                deep_analysis: isDeepAnalysis
            });

            dispatch(analysisSuccess(response.data.analysis));

            if (response.data.analysis.deep_analysis_pending) {
                setDeepAnalysisStatus({ status: 'queued' });
                pollInterval.current = setInterval(() => {
                    checkDeepAnalysisStatus(repoFullName);
                }, 2000);
            }
        } catch (error) {
            dispatch(analysisError(error.response?.data?.message || error.message));
        }
    };

    const indexOfLastBranch = currentPage * branchesPerPage;
    const indexOfFirstBranch = indexOfLastBranch - branchesPerPage;
    const currentBranches = branches.slice(
        indexOfFirstBranch,
        indexOfLastBranch
    );
    const totalPages = Math.ceil(branches.length / branchesPerPage);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Repository Analysis
                </h2>
            }
        >
            <Head title="Repository Analysis" />

            <div className="py-12">
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
                                            onChange={(e) =>
                                                dispatch(
                                                    setGithubUrl(e.target.value)
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Example:
                                        https://github.com/laravel/laravel
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2 mt-4">
                                    <Switch
                                        checked={isDeepAnalysis}
                                        onChange={setIsDeepAnalysis}
                                        className={`${
                                            isDeepAnalysis ? 'bg-indigo-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                    >
                                        <span
                                            className={`${
                                                isDeepAnalysis ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </Switch>
                                    <span className="text-sm text-gray-600">
                                        Enable Deep Analysis
                                    </span>
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

            {branches.length > 0 && (
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 mt-12">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium">
                                Repository Branches
                            </h3>
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">
                                    Show Branches
                                </span>
                                <Switch
                                    checked={showBranches}
                                    onChange={setShowBranches}
                                    className={`${
                                        showBranches
                                            ? "bg-indigo-600"
                                            : "bg-gray-200"
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                >
                                    <span
                                        className={`${
                                            showBranches
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>
                        </div>

                        {showBranches && (
                            <>
                                <div className="space-y-4">
                                    {currentBranches.map((branch) => (
                                        <div
                                            key={branch.name}
                                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <svg
                                                        className="h-5 w-5 text-gray-500"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path d="M2 5a2 2 0 012-2h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                                                    </svg>
                                                    <span className="font-medium text-gray-900">
                                                        {branch.name}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        analyzeBranch(
                                                            branch.name
                                                        )
                                                    }
                                                    disabled={
                                                        analyzingBranch ===
                                                        branch.name
                                                    }
                                                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                                                        analyzingBranch ===
                                                        branch.name
                                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                            : branchAnalysis[
                                                                  branch.name
                                                              ]
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                                    }`}
                                                >
                                                    {analyzingBranch ===
                                                    branch.name ? (
                                                        <>
                                                            <svg
                                                                className="animate-spin h-4 w-4 text-gray-500"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                />
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                />
                                                            </svg>
                                                            <span>
                                                                Analyzing
                                                                Branch...
                                                            </span>
                                                        </>
                                                    ) : branchAnalysis[
                                                          branch.name
                                                      ] ? (
                                                        "View Analysis"
                                                    ) : (
                                                        "Analyze Branch"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                                            currentPage === 1
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        <span>Previous</span>
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm ${
                                            currentPage === totalPages
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span>Next</span>
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {isAnalyzing && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Analyzing Repository...
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                            {Math.round(analysisProgress)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${analysisProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {isDeepAnalysis && deepAnalysisStatus && (
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <DeepAnalysisStatus status={deepAnalysisStatus.status} />
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
