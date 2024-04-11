'use client';

import React from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/NavBar/NavBar";

const Map = dynamic(() => import("../components/Map/Map"), { ssr: false });

const Home = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1">
        <Map />
      </div>
    </div>
  );
};

export default Home;
