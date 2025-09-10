import { useEffect } from "react";
import { getItemList } from "../services/getItemList";

const ItemListPage = () => {
  useEffect(() => {
    (async () => {
      getItemList();
    })()
  })
  return (
    <></>
  )
}

export default ItemListPage;