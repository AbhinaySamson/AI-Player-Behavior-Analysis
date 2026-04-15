import heapq
import random

# A* Algorithm
def astar(grid, start, goal):
    rows = len(grid)
    cols = len(grid[0])

    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    open_set = []
    heapq.heappush(open_set, (0, start))

    came_from = {}
    g_score = {start: 0}

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            return path

        neighbors = [
            (current[0]+1, current[1]),
            (current[0]-1, current[1]),
            (current[0], current[1]+1),
            (current[0], current[1]-1)
        ]

        for neighbor in neighbors:
            r, c = neighbor

            if 0 <= r < rows and 0 <= c < cols and grid[r][c] == 0:
                tentative_g = g_score[current] + 1

                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score = tentative_g + heuristic(neighbor, goal)
                    heapq.heappush(open_set, (f_score, neighbor))

    return None


def generate_valid_grid(size, obstacle_prob):
    while True:
        grid = [
            [
                1 if random.random() < obstacle_prob else 0
                for _ in range(size)
            ]
            for _ in range(size)
        ]

        grid[0][0] = 0
        grid[size-1][size-1] = 0

        path = astar(grid, (0,0), (size-1, size-1))

        if path:
            return grid