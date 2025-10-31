"use client";

import { Input } from "@/components/ui/input";
import { GOOGLE_MAPS_API_KEY } from "@/lib/env";
import { Location } from "@/types/models";
import { useEffect, useRef, useState } from "react";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { cn } from "@/lib/utils";

interface PlacesAutocompleteProps {
  value: Location | null;
  onChange: (location: Location | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PlacesAutocomplete({
  value,
  onChange,
  placeholder = "Search for a place...",
  disabled = false,
}: PlacesAutocompleteProps) {
  const [displayValue, setDisplayValue] = useState(
    value?.address || value?.city || ""
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const updateDisplayValue = () => {
      if (value?.address || value?.city) {
        setDisplayValue(value.address || value.city || "");
      } else {
        setDisplayValue("");
      }
    };
    updateDisplayValue();
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (!place) {
      onChange(null);
      setDisplayValue("");
      setIsOpen(false);
      return;
    }

    const address = place.formatted_address || "";
    const city =
      place.address_components?.find((ac) => ac.types.includes("locality"))
        ?.long_name || "";
    const state =
      place.address_components?.find((ac) =>
        ac.types.includes("administrative_area_level_1")
      )?.short_name || "";
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();

    const location: Location = {
      address,
      city,
      state,
      latitude: lat,
      longitude: lng,
    };

    onChange(location);
    setDisplayValue(address);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handlePredictionClick = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService) return;

    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: [
          "formatted_address",
          "address_components",
          "geometry",
          "name",
        ],
      },
      (placeDetails) => {
        handlePlaceSelect(placeDetails);
      }
    );
  };

  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = evt.target.value;
    setDisplayValue(inputValue);
    
    if (inputValue.length > 0) {
      getPlacePredictions({ input: inputValue });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (placePredictions.length > 0 && displayValue.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    setTimeout(() => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(document.activeElement)
      ) {
        setIsOpen(false);
      }
    }, 200);
  };

  const shouldShowDropdown =
    isOpen &&
    isFocused &&
    displayValue.length > 0 &&
    (placePredictions.length > 0 || isPlacePredictionsLoading);

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        disabled={disabled}
        className="w-full"
      />
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 w-full mt-1 bg-popover text-popover-foreground",
            "rounded-md border shadow-md",
            "max-h-[300px] overflow-auto"
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          {isPlacePredictionsLoading && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Loading...
            </div>
          )}
          {!isPlacePredictionsLoading && placePredictions.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No places found
            </div>
          )}
          {!isPlacePredictionsLoading && placePredictions.length > 0 && (
            <ul>
              {placePredictions.map((prediction) => (
                <li
                  key={prediction.place_id}
                  className="cursor-pointer px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handlePredictionClick(prediction);
                  }}
                >
                  <div className="font-medium">{prediction.description}</div>
                  {prediction.structured_formatting?.secondary_text && (
                    <div className="text-xs text-muted-foreground">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
