"use client";

import { Protect } from "@clerk/nextjs";
import CustomClerkPricing from "@/components/custom-clerk-pricing";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCopy, IconKey, IconTrash, IconEye, IconEyeOff } from "@tabler/icons-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function UpgradeCard() {
  return (
    <>
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-center text-2xl font-semibold lg:text-3xl">
          Upgrade to Access API Keys
        </h1>
        <p>
          API Keys are available on paid plans. Generate and manage secure API
          keys to integrate UserVibes OS into your applications.
        </p>
      </div>
      <div className="px-8 lg:px-12">
        <CustomClerkPricing />
      </div>
    </>
  );
}

function ApiKeysCard() {
  const [keyName, setKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{
    fullKey: string;
    keyPrefix: string;
    name: string;
  } | null>(null);

  const apiKeys = useQuery(api.apiKeys.getUserApiKeys);
  const createApiKey = useAction(api.apiKeysActions.createApiKey);
  const deleteApiKey = useMutation(api.apiKeys.deleteApiKey);
  const revokeApiKey = useMutation(api.apiKeys.revokeApiKey);

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      toast.error("Please enter a name for your API key");
      return;
    }

    try {
      const result = await createApiKey({ name: keyName });
      setNewKeyData({
        fullKey: result.fullKey,
        keyPrefix: result.keyPrefix,
        name: result.name,
      });
      setShowNewKey(true);
      setKeyName("");
      toast.success("API Key created successfully!");
    } catch (error) {
      toast.error("Failed to create API key");
      console.error(error);
    }
  };

  const handleCopyKey = () => {
    if (newKeyData?.fullKey) {
      navigator.clipboard.writeText(newKeyData.fullKey);
      setCopied(true);
      toast.success("API Key copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteApiKey({ keyId: keyId as any });
      toast.success("API Key deleted successfully");
    } catch (error) {
      toast.error("Failed to delete API key");
      console.error(error);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) {
      return;
    }

    try {
      await revokeApiKey({ keyId: keyId as any });
      toast.success("API Key revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke API key");
      console.error(error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys for programmatic access to UserVibes OS
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <IconKey className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Keep your API keys secure
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Treat your API keys like passwords. Never share them publicly or commit them to version control.
                Each key is only shown once upon creation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Key Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Generate a new API key for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key-name">Key Name</Label>
            <div className="flex gap-2">
              <Input
                id="key-name"
                placeholder="e.g., Production App, Development, Mobile App"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
              />
              <Button onClick={handleCreateKey} disabled={!keyName.trim()}>
                Create Key
              </Button>
            </div>
          </div>

          {/* Show New Key Modal */}
          {showNewKey && newKeyData && (
            <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-green-900 dark:text-green-100">
                      Your New API Key
                    </Label>
                    <Badge variant="outline" className="text-green-700 border-green-500">
                      {newKeyData.name}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyData.fullKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyKey}
                      className="relative"
                    >
                      {copied ? (
                        <>
                          <IconCopy className="h-4 w-4" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            Copied!
                          </span>
                        </>
                      ) : (
                        <IconCopy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ⚠️ Make sure to copy your API key now. You won't be able to see it again!
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNewKey(false);
                    setNewKeyData(null);
                  }}
                >
                  I've saved my key
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Existing Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            {apiKeys?.length || 0} active {apiKeys?.length === 1 ? "key" : "keys"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconKey className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No API keys yet</p>
              <p className="text-sm">Create your first API key to get started</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {key.keyPrefix}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={key.isActive ? "default" : "secondary"}
                        >
                          {key.isActive ? "Active" : "Revoked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(key.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {key.lastUsed ? formatDate(key.lastUsed) : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {key.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeKey(key.id)}
                            >
                              <IconEyeOff className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Using Your API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Include your API key in the Authorization header of your requests:
            </p>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              <code>{`curl https://api.uservibes.com/v1/feedback \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
            </pre>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Security Best Practices</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Store API keys in environment variables, never in code</li>
              <li>Use different keys for development and production</li>
              <li>Rotate keys regularly</li>
              <li>Revoke keys immediately if compromised</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApiKeysPage() {
  return (
    <Protect
      condition={(has) => {
        // Check if user has any of the paid plans
        return !has({ plan: "free_user" });
      }}
      fallback={<UpgradeCard />}
    >
      <ApiKeysCard />
    </Protect>
  );
}
