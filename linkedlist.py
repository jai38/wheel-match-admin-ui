


def main():
    class ListNode:
        def __init__(self, value=0, next=None):
            self.value = value
            self.next = next

    shared = ListNode(8, ListNode(10))
    headA = ListNode(1, ListNode(3, shared))
    headB = ListNode(99, ListNode(shared))

    intersection_node = get_intersection_node(headA, headB)
    if intersection_node:
        print(f"Intersection at node with value: {intersection_node.value}")
    else:
        print("No intersection found.")


def get_intersection_node(headA, headB):
    if not headA or not headB:
        return None

    pointerA = headA
    pointerB = headB

    while pointerA != pointerB:
        print(pointerA.value if pointerA else None, pointerB.value if pointerB else None)
        pointerA = pointerA.next if pointerA else headB
        pointerB = pointerB.next if pointerB else headA

    return pointerA



main()