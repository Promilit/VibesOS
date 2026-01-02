"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, MessageSquare, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsTabProps {
  projectId: Id<"projects">;
}

const STATUS_COLORS = {
  backlog: "#64748b",      // slate
  inProgress: "#3b82f6",   // blue
  review: "#f59e0b",       // amber
  done: "#10b981",         // green
};

export function AnalyticsTab({ projectId }: AnalyticsTabProps) {
  const analytics = useQuery(api.projects.analytics.queries.getProjectAnalytics, { projectId });
  const voteTrends = useQuery(api.projects.analytics.queries.getVoteTrends, { projectId, days: 30 });
  const activityTrends = useQuery(api.projects.analytics.queries.getActivityTrends, { projectId, days: 30 });
  const userEngagement = useQuery(api.projects.analytics.queries.getUserEngagement, { projectId });

  if (analytics === undefined || voteTrends === undefined || activityTrends === undefined || userEngagement === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { summary, statusBreakdown, topItems } = analytics;

  // Calculate trends (compare last 7 days vs previous 7 days)
  const last7Days = activityTrends.slice(-7);
  const previous7Days = activityTrends.slice(-14, -7);

  const recentVotes = last7Days.reduce((sum: number, day: any) => sum + day.votes, 0);
  const previousVotes = previous7Days.reduce((sum: number, day: any) => sum + day.votes, 0);
  const votesTrend = previousVotes === 0 ? 0 : ((recentVotes - previousVotes) / previousVotes) * 100;

  const recentItems = last7Days.reduce((sum: number, day: any) => sum + day.items, 0);
  const previousItems = previous7Days.reduce((sum: number, day: any) => sum + day.items, 0);
  const itemsTrend = previousItems === 0 ? 0 : ((recentItems - previousItems) / previousItems) * 100;

  // Prepare pie chart data
  const pieData = [
    { name: "Backlog", value: statusBreakdown.backlog, color: STATUS_COLORS.backlog },
    { name: "In Progress", value: statusBreakdown.inProgress, color: STATUS_COLORS.inProgress },
    { name: "Review", value: statusBreakdown.review, color: STATUS_COLORS.review },
    { name: "Done", value: statusBreakdown.done, color: STATUS_COLORS.done },
  ].filter((item) => item.value > 0);

  const TrendIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 1) {
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Minus className="h-3 w-3" />
          <span>No change</span>
        </div>
      );
    }

    if (value > 0) {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <ArrowUp className="h-3 w-3" />
          <span>+{value.toFixed(1)}%</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-xs text-red-600">
        <ArrowDown className="h-3 w-3" />
        <span>{value.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems}</div>
            <TrendIndicator value={itemsTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalVotes}</div>
            <TrendIndicator value={votesTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userEngagement.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Who voted or commented</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalComments}</div>
            <p className="text-xs text-muted-foreground">Total discussions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="votes">Vote Trends</TabsTrigger>
          <TabsTrigger value="status">Status Breakdown</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
        </TabsList>

        {/* Activity Trends */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Over Time (Last 30 Days)</CardTitle>
              <CardDescription>Track items created, votes, and comments daily</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="items"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    name="Items Created"
                  />
                  <Area
                    type="monotone"
                    dataKey="votes"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Votes"
                  />
                  <Area
                    type="monotone"
                    dataKey="comments"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    name="Comments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vote Trends */}
        <TabsContent value="votes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vote Trends (Last 30 Days)</CardTitle>
              <CardDescription>Daily vote activity from your users</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={voteTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="votes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Votes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Breakdown */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Items by Status</CardTitle>
                <CardDescription>Distribution across workflow stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Details</CardTitle>
                <CardDescription>Item counts by stage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.backlog }} />
                    <span className="text-sm">Backlog</span>
                  </div>
                  <span className="text-sm font-semibold">{statusBreakdown.backlog}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.inProgress }} />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <span className="text-sm font-semibold">{statusBreakdown.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.review }} />
                    <span className="text-sm">Review</span>
                  </div>
                  <span className="text-sm font-semibold">{statusBreakdown.review}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.done }} />
                    <span className="text-sm">Done</span>
                  </div>
                  <span className="text-sm font-semibold">{statusBreakdown.done}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Engagement */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Items by Votes</CardTitle>
                <CardDescription>Most popular feature requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topItems.slice(0, 5).map((item: any, index: number) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {item.voteCount} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {item.commentCount} comments
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {topItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No items yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
                <CardDescription>Top contributors by engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userEngagement.topUsers.slice(0, 5).map((user: any, index: number) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div className="text-sm font-mono text-muted-foreground truncate">
                          {user.userId.substring(0, 12)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{user.votes} votes</span>
                        <span>•</span>
                        <span>{user.comments} comments</span>
                      </div>
                    </div>
                  ))}
                  {userEngagement.topUsers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No user activity yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
