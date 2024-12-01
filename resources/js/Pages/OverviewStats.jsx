import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-sm text-gray-600">Loading data...</p>
    </div>
);

const NoDataMessage = ({ message = "No data available" }) => (
    <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
        <svg
            className="h-12 w-12 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
        </svg>
        <p>{message}</p>
    </div>
);

export default function OverviewStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRepositoryStats();
    }, []);

    const fetchRepositoryStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/repository-stats');
            console.log('Stats response:', response.data); // Debug log
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setError(error.response?.data?.error || 'Failed to fetch repository stats');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <AuthenticatedLayout>
                <Head title="Overview Stats" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Overview Stats" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[600px]">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
                            <p className="mt-4 text-lg text-gray-600">Loading repository statistics...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6">
                            {/* Pull Requests Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pull Requests by User</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!stats?.pullRequests?.length ? (
                                        <NoDataMessage message="No pull requests found" />
                                    ) : (
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.pullRequests}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="user" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="count" fill="#8884d8" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Languages Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Languages Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!stats?.languages?.length ? (
                                        <NoDataMessage message="No language data available" />
                                    ) : (
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={stats.languages}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        label
                                                    >
                                                        {stats.languages.map((entry, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={COLORS[index % COLORS.length]} 
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Commits Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Commit Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!stats?.commits?.length ? (
                                        <NoDataMessage message="No commit data available" />
                                    ) : (
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={stats.commits}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="count" 
                                                        stroke="#82ca9d" 
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Summary Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Repository Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!stats?.summary ? (
                                        <NoDataMessage message="No summary data available" />
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Total PRs</span>
                                                <span className="text-2xl font-bold">
                                                    {stats.summary.totalPRs}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Total Commits</span>
                                                <span className="text-2xl font-bold">
                                                    {stats.summary.totalCommits}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Active Contributors</span>
                                                <span className="text-2xl font-bold">
                                                    {stats.summary.activeContributors}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
