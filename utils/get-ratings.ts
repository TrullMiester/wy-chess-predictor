"use server"

import prisma from '../utils/prisma'

export async function getRatings(id: string) {
  return (await prisma.team.findFirst({where: { id: id }}))?.ratings
}

