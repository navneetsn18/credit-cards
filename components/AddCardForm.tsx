"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Image, List, Plus } from "lucide-react";
import { browserCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

interface AddCardFormProps {
  onCardAdded: () => void;
  disabled?: boolean;
}

interface ExistingCard {
  _id: string;
  name: string;
  imageUrl?: string;
}

export default function AddCardForm({
  onCardAdded,
  disabled = false,
}: AddCardFormProps) {
  const [formData, setFormData] = useState({
    cardName: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [existingCards, setExistingCards] = useState<ExistingCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
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

      // Check if response is ok
      if (!response.ok) {
        console.error(
          "API response not ok:",
          response.status,
          response.statusText
        );
        setMessage({
          type: "error",
          text: `Server error: ${response.status} ${response.statusText}`,
        });
        return;
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        const text = await response.text();
        console.error("Response text:", text);
        setMessage({
          type: "error",
          text: "Server returned invalid response format",
        });
        return;
      }

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Card added successfully!" });
        setFormData({ cardName: "", imageUrl: "" });
        onCardAdded();
        // Invalidate cache and refresh the existing cards list
        browserCache.delete(CACHE_KEYS.CARD_NAMES);
        fetchExistingCards(true);
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
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  const fetchExistingCards = async (forceRefresh = false) => {
    try {
      setLoadingCards(true);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedCards = browserCache.get<ExistingCard[]>(
          CACHE_KEYS.CARD_NAMES
        );
        if (cachedCards) {
          setExistingCards(cachedCards);
          setLoadingCards(false);
          return;
        }
      }

      const response = await fetch("/api/cards/names");

      // Check if response is ok
      if (!response.ok) {
        console.warn(
          "Failed to fetch cards:",
          response.status,
          response.statusText
        );
        // Don't show error to user for card loading failures
        setExistingCards([]);
        return;
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Response is not JSON:", contentType);
        setExistingCards([]);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Sort cards by name alphabetically
        const sortedCards = (data.data || []).sort(
          (a: ExistingCard, b: ExistingCard) => a.name.localeCompare(b.name)
        );
        setExistingCards(sortedCards);

        // Cache the results
        browserCache.set(
          CACHE_KEYS.CARD_NAMES,
          sortedCards,
          CACHE_TTL.CARD_NAMES
        );
      } else {
        console.warn("API returned error:", data.message);
        setExistingCards([]);
      }
    } catch (error) {
      console.warn("Error fetching existing cards:", error);
      // Silently fail for card loading - don't disrupt the main form functionality
      setExistingCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    // Auto-fetch existing cards on component mount
    fetchExistingCards();
  }, []);

  return (
    <div className="space-y-6">
      {/* Add New Card Form */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Plus className="h-5 w-5" />
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
                disabled={disabled || isLoading}
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
                disabled={disabled || isLoading}
                className="text-gray-900 bg-white"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt={`Preview of ${formData.cardName || "card"} image`}
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
              disabled={disabled || isLoading || !formData.cardName.trim()}
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

      {/* Existing Cards Display */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <List className="h-5 w-5" />
                Available Cards ({existingCards.length})
              </CardTitle>
              <CardDescription>
                All credit cards in your collection, sorted alphabetically
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchExistingCards(true)}
              disabled={loadingCards}
            >
              {loadingCards ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh Cards"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingCards ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-gray-600">Loading cards...</span>
            </div>
          ) : existingCards.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No cards added yet</p>
              <p className="text-sm text-gray-500">
                Add your first card using the form above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingCards.map((card) => (
                <div
                  key={card._id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={`${card.name} credit card`}
                        className="w-12 h-8 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 break-words leading-tight">
                      {card.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Available
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
