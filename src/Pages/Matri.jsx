import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Card from "../Components/Card";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";

export default function Matri() {
  const location = useLocation();

  const [user, setUser] = useState([]);
  const loadData = async () => {
    let response = await fetch("http://localhost:8008/api/matriData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    response = await response.json();
    console.log(response[0]);
    setUser(response[0]);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="px-4 md:px-10 lg:px-20 mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {location.state.religion ? (
          user
            .filter(
              (item) =>
                item.religion.toLowerCase() ==
                location.state.religion.toLowerCase()
            )
            .map((filtered) => {
              return (
                <div key={filtered.id}>
                  <Card
                    name={filtered.name}
                    sex={filtered.sex}
                    prof={filtered.prof}
                  />
                </div>
              );
            })
        ) : (
          <>
            {location.state.language
              ? user
                  .filter(
                    (item) =>
                      item.motherTongue.toLowerCase() ==
                      location.state.language.toLowerCase()
                  )
                  .map((filtered) => {
                    return (
                      <div key={filtered.id}>
                        <Card
                          name={filtered.name}
                          sex={filtered.sex}
                          prof={filtered.prof}
                        />
                      </div>
                    );
                  })
              : user
                  .filter(
                    (item) =>
                      item.profession.toLowerCase() ==
                      location.state.prof.toLowerCase()
                  )
                  .map((filtered) => {
                    return (
                      <div key={filtered.id}>
                        <Card
                          name={filtered.name}
                          sex={filtered.sex}
                          prof={filtered.prof}
                        />
                      </div>
                    );
                  })}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
