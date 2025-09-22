"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Image } from "lucide-react";

interface AddCardFormProps {
  onCardAdded: () => void;
}

export default function AddCardForm({ onCardAdded }: AddCardFormProps) {
  const [formData, setFormData] = useState({
    cardName: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cardName.trim()) {
      setMessage({ type: "error", text: "Card name is required" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/cards/names", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.cardName.trim(),
          imageUrl: formData.imageUrl.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Card added successfully!" });
        setFormData({ cardName: "", imageUrl: "" });
        onCardAdded();
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to add card",
        });
      }
    } catch (error) {
      console.error("Error adding card:", error);
      setMessage({
        type: "error",
        text: "Failed to add card. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Add New Card
        </CardTitle>
        <CardDescription>
          Add a new credit card to your collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Card Name *</Label>
            <Input
              id="cardName"
              type="text"
              placeholder="e.g., Chase Sapphire Preferred"
              value={formData.cardName}
              onChange={(e) => handleInputChange("cardName", e.target.value)}
              disabled={isLoading}
              className="text-gray-900 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Card Image URL (Optional)
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/card-image.jpg"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
              disabled={isLoading}
              className="text-gray-900 bg-white"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Card preview"
                  className="w-16 h-10 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !formData.cardName.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Card"
            )}
          </Button>
        </form>

        {message && (
          <Alert
            className={`mt-4 ${
              message.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <AlertDescription
              className={
                message.type === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
