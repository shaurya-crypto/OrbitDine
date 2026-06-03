import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCart, addToCart, updateCartItem, removeFromCart, clearCart } from "@/services/cartService";

export function useCart(sessionId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: () => fetchCart(sessionId!),
    enabled: !!sessionId,
  });

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (data) => {
      // Update cache directly with returned totals
      queryClient.setQueryData(["cart", sessionId], data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCartItem,
    // Optimistic Update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["cart", sessionId] });
      const previousCart = queryClient.getQueryData(["cart", sessionId]);
      
      // We optimistically just update the quantity in the cache, but wait for server to calc real totals
      if (previousCart) {
        queryClient.setQueryData(["cart", sessionId], (old: any) => {
          const newCartItems = old.cart.map((item: any) =>
            item._id === variables.cartItemId ? { ...item, quantity: variables.quantity } : item
          );
          return { ...old, cart: newCartItems };
        });
      }
      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["cart", sessionId], context?.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: (data) => {
      queryClient.setQueryData(["cart", sessionId], data);
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: (data) => {
      queryClient.setQueryData(["cart", sessionId], data);
    },
  });

  return {
    ...query,
    addToCart: addMutation.mutateAsync,
    updateQuantity: updateMutation.mutate, // We expose non-async for instant UI feeling without awaiting
    removeFromCart: removeMutation.mutateAsync,
    clearCart: clearMutation.mutateAsync,
    isAdding: addMutation.isPending,
  };
}
