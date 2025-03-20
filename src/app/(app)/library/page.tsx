"use client";
import checkAuth from "@/HOC/checkAuth";
import axios from "axios";
import { useEffect, useState } from "react";
import CuenttoFeedCard from "@/app/components/ui/cuenttos/cuenttoFeedCard";
import FeaturedCuenttoFeedCard from "@/app/components/ui/cuenttos/featuredCuenttosCard";
import { SkeletonCuenttoFeatured } from "@/app/components/skeletons/CuenttoFeatured";
import { SkeletonCuenttoFeed } from "@/app/components/skeletons/CuenttoFeed";

interface Cuentto {
  id: number;
  title: string;
  description: string;
  duration: number;
  createdAt: string;
  mood: {
    title: string;
    color: string;
  };
  user: {
    username: string;
    profileName: string;
    profilePicture?: string;
  };
  _count: {
    comments: number;
  };
}
interface Featured {
  id: number;
  title: string;
  duration: number;
  createdAt: string;
  mood: {
    title: string;
    color: string;
  };
  user: {
    username: string;
    profileName: string;
    profilePicture?: string;
  };
}
function LibraryPage() {
  const [cuenttos, setCuenttos] = useState<Cuentto[]>([]);
  const [featured, setFeatured] = useState<Featured[]>([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  useEffect(() => {
    const fetchCuenttos = async () => {
      try {
        setLoading1(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/feed/all`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setCuenttos(response.data.cuenttos);
      } catch (error) {
        console.error("Error fetching cuenttos:", error);
      } finally {
        setLoading1(false);
      }
    };
    fetchCuenttos();
  }, []);

  useEffect(() => {
    const fetchFeaturedCuenttos = async () => {
      try {
        setLoading2(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/feed/featured`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        console.log("data.featured:", response.data);
        setFeatured(response.data.cuenttos || []);
      } catch (error) {
        console.error("Error fetching featured cuenttos:", error);
      } finally {
        setLoading2(false);
      }
    };
    fetchFeaturedCuenttos();
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
