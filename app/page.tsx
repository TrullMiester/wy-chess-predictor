"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getRatings } from "@/utils/get-ratings";
import { setRatings } from "@/utils/set-ratings";
import { calculateOverrideValues } from "next/dist/server/font-utils";
import { useEffect, useState } from "react";

export default function Home() {
  const [team1, setTeam1] = useState<any>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [team2, setTeam2] = useState<any>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [load, setLoad] = useState(true);

  const [expectedPoints, setExpectedPoints] = useState('');
  const [win, setWin] = useState('');
  const [draw, setDraw] = useState('');
  const [lose, setLose] = useState('');

  function erf(x: number) {
    // save the sign of x
    var sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    // constants
    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var p = 0.3275911;

    // A&S formula 7.1.26
    var t = 1.0 / (1.0 + p * x);
    var y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y; // erf(-x) = -erf(x);
  }

  const cdf = (exp: number, stddev: number, mean: number) => {
    const z = (mean - exp) / (stddev * Math.sqrt(2));

    return 0.5 * (1 + erf(z));
  };

  const calc = () => {
    let ev = 0;
    let stddev = 0;

    let new1ratings = []
    let new2ratings = []

    for (let i = 0; i < 8; i++) {
      let board1 = parseInt(
        (document.getElementById("team1" + i) as HTMLInputElement).value
      );
      let board2 = parseInt(
        (document.getElementById("team2" + i) as HTMLInputElement).value
      );

      if (board1 == null || board2 == null) return;

      new1ratings.push(board1)
      new2ratings.push(board2)

      let prob = 1 / (1 + Math.pow(10, -((board1 - board2) / 400)));
      ev += prob * (12 - i);
      stddev += prob * (1 - prob) * (12 - i) * (12 - i);
    }

    stddev = Math.pow(stddev, 0.5);

    let winn = 1 - cdf(ev, stddev, 34.5);
    let losee = cdf(ev, stddev, 33.5);
    let draww = 1 - winn - losee


    console.log(new1ratings, new2ratings, ev, stddev)

    setTeam1(new1ratings)
    setTeam2(new2ratings)
    setWin((winn*100).toFixed(2))
    setDraw((draww*100).toFixed(2))
    setLose((losee*100).toFixed(2))
    setExpectedPoints(ev.toFixed(2))

    setRatings("team1", new1ratings)
    setRatings("team2", new2ratings)
  };

  useEffect(() => {
    const getData = async () => {
      setTeam1(await getRatings("team1"));
      setTeam2(await getRatings("team2"));
      setLoad(false);
    };

    if (load) {
      getData();
    }
  }, [])

  return (
    <div className="w-screen h-screen flex bg-white text-black">
      <div className="m-4">
        <h1 className="mb-4">TEAM 1</h1>
        <div className="flex flex-col gap-2">
          {team1.map((board: number, index: number) => {
            return (
              <Input
                defaultValue={team1[index]}
                type="number"
                key={"team1" + index}
                id={"team1" + index}
              />
            );
          })}
          <Button variant="outline" onClick={calc}>Calculate</Button>
        </div>
      </div>
      <div className="m-4">
        <h1 className="mb-4">TEAM 2</h1>
        <div className="flex flex-col gap-2">
          {team2.map((board: number, index: number) => {
            return (
              <Input
                defaultValue={team2[index]}
                type="number"
                key={"team2" + index}
                id={"team2" + index}
              />
            );
          })}
        </div>
      </div>
      <div className="my-32 ml-64 flex flex-col gap-4">
        <span>Expected Points: {expectedPoints}</span>
        <span>Win%: {win}%</span>
        <span>Draw%: {draw}%</span>
        <span>Lose%: {lose}%</span>
      </div>
    </div>
  );
}
