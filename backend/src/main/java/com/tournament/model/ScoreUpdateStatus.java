package com.tournament.model;

/**
 * Represents the status immediately following a score update action.
 */
public enum ScoreUpdateStatus {
    /**
     * The score was updated, but the current set is still ongoing.
     */
    SET_IN_PROGRESS,

    /**
     * The score update resulted in completing a set, but the overall match continues.
     * The frontend should typically prepare for the next set.
     */
    SET_COMPLETED_MATCH_IN_PROGRESS,

    /**
     * The score update resulted in completing the match (either by winning the required sets
     * or by playing all intended sets).
     */
    MATCH_COMPLETED
} 