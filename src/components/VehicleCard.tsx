import { useState } from "react";
import { Link } from "react-router";
import { type Vehicle, formatPrice, formatMileage } from "../data/vehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const [imgHovered, setImgHovered] = useState(false);
  const orderedImages = vehicle.images;

  const statusLabel = vehicle.status === "reserved" ? "RESERVADO" : null;

  return (
    <Link
      to={`/veiculos/${vehicle.slug}`}
      className="block group"
      style={{ textDecoration: "none" }}
    >
      <article
        className="overflow-hidden transition-all duration-300"
        style={{
          background: "#111111",
          border: "1px solid #1e1e1e",
          borderRadius: "4px",
          transform: imgHovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: imgHovered ? "0 20px 40px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.3)",
        }}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: "200px", background: "#0a0a0a" }}>
          <img
            src={orderedImages[0]}
            alt={`${vehicle.brand} ${vehicle.model} ${vehicle.version}`}
            className="w-full h-full transition-transform duration-500"
            style={{ objectFit: "cover", transform: imgHovered ? "scale(1.05)" : "scale(1)" }}
            loading="lazy"
          />
          {vehicle.isNew && (
            <span
              className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 tracking-wider"
              style={{ background: "#ccdd8f", color: "#000", fontFamily: "Montserrat, sans-serif", borderRadius: "2px" }}
            >
              NOVO NO ESTOQUE
            </span>
          )}
          {statusLabel && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
              <span className="text-sm font-bold tracking-widest px-3 py-1.5" style={{ border: "1px solid #ffffff", color: "#ffffff", fontFamily: "Montserrat, sans-serif" }}>
                {statusLabel}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-semibold tracking-wider mb-0.5" style={{ color: "#838383", fontFamily: "Montserrat, sans-serif" }}>
                {vehicle.brand.toUpperCase()}
              </p>
              <h3 className="text-base font-bold leading-tight" style={{ fontFamily: "Montserrat, sans-serif", color: "#ffffff" }}>
                {vehicle.model}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "#838383" }}>
                {vehicle.version}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[`${vehicle.year}`, formatMileage(vehicle.mileage), vehicle.transmission].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5"
                style={{ background: "#1a1a1a", color: "#838383", borderRadius: "2px", fontFamily: "Montserrat, sans-serif" }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              {vehicle.promotionalPrice ? (
                <>
                  <p className="text-xs line-through" style={{ color: "#555" }}>{formatPrice(vehicle.price)}</p>
                  <p className="text-lg font-black" style={{ fontFamily: "Montserrat, sans-serif", color: "#ccdd8f" }}>
                    {formatPrice(vehicle.promotionalPrice)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-black" style={{ fontFamily: "Montserrat, sans-serif", color: "#ccdd8f" }}>
                  {formatPrice(vehicle.price)}
                </p>
              )}
            </div>
            <span
              className="text-xs font-bold tracking-wider transition-colors duration-200"
              style={{ fontFamily: "Montserrat, sans-serif", color: imgHovered ? "#ccdd8f" : "#555" }}
            >
              VER →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
