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
    <div className="pl-[110px]">
      <div className="flex flex-col gap-[16px]">
        <h2 className="text-dark-gray text-[12px] font-medium">
          FEATURED CUENTTOS
        </h2>
        {loading1 ? (
          <SkeletonCuenttoFeatured />
        ) : (
          <>
            <div className="flex flex-row gap-[20px]">
              {featured.map((cuentto) => (
                <FeaturedCuenttoFeedCard key={cuentto.id} cuentto={cuentto} />
              ))}
            </div>
          </>
        )}
      </div>
      {loading2 ? (
        <SkeletonCuenttoFeed />
      ) : (
        <>
          <div className="flex flex-col gap-[20px] mt-[80px] ">
            {cuenttos.map((cuentto) => (
              <CuenttoFeedCard key={cuentto.id} cuentto={cuentto} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
export default checkAuth(LibraryPage);
