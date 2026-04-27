"use client";
import checkAuth from "@/HOC/checkAuth";
import { useEffect, useState } from "react";
import CuenttoFeedCard from "@/app/components/ui/cuenttos/cuenttoFeedCard";
import FeaturedCuenttoFeedCard from "@/app/components/ui/cuenttos/featuredCuenttosCard";
import { SkeletonCuenttoFeatured } from "@/app/components/skeletons/CuenttoFeatured";
import { SkeletonCuenttoFeed } from "@/app/components/skeletons/CuenttoFeed";
import { Cuentto, FeaturedCuentto } from "@/types/cuentto";
import { fetchAllCuenttos, fetchFeaturedCuenttos } from "@/lib/api/cuentto";

function LibraryPage() {
  const [cuenttos, setCuenttos] = useState<Cuentto[]>([]);
  const [featured, setFeatured] = useState<FeaturedCuentto[]>([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  useEffect(() => {
    const getCuenttos = async () => {
      try {
        setLoading1(true);
        const data = await fetchAllCuenttos();
        setCuenttos(data);
      } catch (error) {
        console.log(error)
      } finally {
        setLoading1(false);
      }
    };
    getCuenttos();
  }, []);

  useEffect(() => {
    const getFeatured = async () => {
      try {
        setLoading2(true);
        const data = await fetchFeaturedCuenttos();
        setFeatured(data);
      } catch (error) {
        console.log(error)
      } finally {
        setLoading2(false);
      }
    };
    getFeatured();
  }, []);
  return (
    <div className="pl-[110px] pr-6 overflow-x-hidden">
      <div className="flex flex-col gap-[16px]">
        <h2 className="text-dark-gray text-[12px] font-medium flex items-center gap-1.5">
          <span aria-hidden>🔥</span> TRENDING CUENTTOS
        </h2>
        {loading1 ? (
          <SkeletonCuenttoFeatured />
        ) : (
          <div className="flex flex-row gap-[20px] overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory md:flex-wrap md:overflow-visible md:snap-none">
            {featured.map((cuentto, idx) => (
              <div key={cuentto.id} className="shrink-0 snap-start md:shrink">
                <FeaturedCuenttoFeedCard cuentto={cuentto} index={idx} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[16px] mt-[80px]">
        <h2 className="text-dark-gray text-[12px] font-medium flex items-center gap-1.5">
          <span aria-hidden>💌</span> SHARED TO YOU
        </h2>
        {loading2 ? (
          <SkeletonCuenttoFeed />
        ) : (
          <div className="flex flex-col gap-[20px]">
            {cuenttos.map((cuentto) => (
              <CuenttoFeedCard
                key={cuentto.id}
                cuentto={cuentto}
                onDeleted={(id) =>
                  setCuenttos((prev) => prev.filter((c) => c.id !== id))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default checkAuth(LibraryPage);
