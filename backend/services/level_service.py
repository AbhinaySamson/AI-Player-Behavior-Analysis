def calculate_level(xp):
    """
    Converts XP to Level.
    You can improve this later to exponential scaling.
    """

    if xp < 100:
        return 1
    elif xp < 300:
        return 2
    elif xp < 600:
        return 3
    elif xp < 1000:
        return 4
    else:
        return 5