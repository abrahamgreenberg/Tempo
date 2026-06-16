// import type { AppState, Column, Item, ItemPlacement } from "@/types/domain"

// export interface ApiItemPayload {
//   id: string
//   name: string
//   durationMinutes: number
//   listId: string
//   position: number
// }

// type BoardSnapshot = Pick<AppState, "columns" | "items" | "itemPlacements">

// /**
//  * Find item placement using O(1) index lookup
//  * Falls back to O(n) scan if placement not found in index
//  */
// export function findItemPlacement(
//   itemPlacements: Record<string, ItemPlacement>,
//   itemId: string,
//   columns?: Record<string, Column>
// ): ItemPlacement | null {
//   // Try O(1) lookup first
//   const placement = itemPlacements[itemId]
//   if (placement) {
//     return placement
//   }

//   // Fallback to O(n) scan if no index (legacy/backup)
//   if (columns) {
//     for (const column of Object.values(columns)) {
//       const position = column.itemIds.indexOf(itemId)
//       if (position !== -1) {
//         return {
//           listId: column.id,
//           position,
//         }
//       }
//     }
//   }

//   return null
// }

// export function toApiItemPayload(
//   items: Record<string, Item>,
//   itemPlacements: Record<string, ItemPlacement>,
//   itemId: string
// ): ApiItemPayload | null {
//   const item = items[itemId]
//   if (!item) {
//     return null
//   }

//   const placement = findItemPlacement(itemPlacements, itemId)
//   if (!placement) {
//     return null
//   }

//   return {
//     id: item.id,
//     name: item.name,
//     durationMinutes: item.durationMinutes,
//     listId: placement.listId,
//     position: placement.position,
//   }
// }

// // export function toApiItemPayloads({
// //   items,
// //   columns,
// // }: BoardSnapshot): ApiItemPayload[] {
// //   return Object.values(columns)
// //     .sort((left, right) => left.position - right.position)
// //     .flatMap((column) =>
// //       column.itemIds.flatMap((itemId, position) => {
// //         const item = items[itemId]
// //         if (!item) {
// //           return []
// //         }

// //         return {
// //           id: item.id,
// //           name: item.name,
// //           durationMinutes: item.durationMinutes,
// //           listId: column.id,
// //           position,
// //         }
// //       })
// //     )
// // }

// export function withDerivedPlacement(
//   item: Item,
//   itemPlacements: Record<string, ItemPlacement>
// ): (Item & ItemPlacement) | null {
//   const placement = findItemPlacement(itemPlacements, item.id)
//   if (!placement) {
//     return null
//   }

//   return {
//     ...item,
//     ...placement,
//   }
// }
