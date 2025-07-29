"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function TestWebhookPage() {
  const [message, setMessage] = useState("你好，请介绍一下保险产品的基本知识");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testWebhook = async () => {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          userId: "test-user-123",
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResponse(data.response);
        if (data.debug) {
          console.log("Debug info:", data.debug);
        }
      } else {
        setError(`Error: ${res.status} - ${data.error || data.response}`);
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">n8n Webhook 测试页面</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            测试消息:
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入测试消息..."
            className="w-full"
          />
        </div>

        <Button 
          onClick={testWebhook}
          disabled={loading || !message.trim()}
          className="w-full"
        >
          {loading ? "发送中..." : "测试 Webhook"}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-semibold text-red-800">错误信息:</h3>
            <pre className="text-sm text-red-700 whitespace-pre-wrap mt-2">
              {error}
            </pre>
          </div>
        )}

        {response && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800">响应结果:</h3>
            <div className="text-sm text-green-700 mt-2 whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-800">调试信息:</h3>
          <div className="text-sm text-blue-700 mt-2">
            <p><strong>Webhook URL:</strong> https://n8n.aifunbox.com/webhook/insurance</p>
            <p><strong>请求方法:</strong> POST</p>
            <p><strong>Content-Type:</strong> application/json</p>
            <p className="mt-2"><strong>发送数据示例:</strong></p>
            <pre className="bg-white p-2 rounded text-xs mt-1">
{JSON.stringify({
  message: "示例消息",
  userId: "test-user-123",
  timestamp: new Date().toISOString()
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}