"use server"

import prisma from '../utils/prisma'

export async function setRatings(id: string, ratings: number[]) {
  await prisma.team.update({
    where: {
      id: id,
    },
    data: {
      ratings: ratings,
    }
  })
}
