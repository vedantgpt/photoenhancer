"""
Entropy State Management for System Collapse

Entropy accumulates per session and causes the system to degrade:
- 0.0-0.3: Normal behavior
- 0.3-0.6: Rules start bending (ignore legs)
- 0.6-0.8: System lies (swap joints)
- 0.8-1.0: Full chaos mode (random mutations)
"""

import uuid
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field

@dataclass
class SessionState:
    entropy: float = 0.0
    attempts: int = 0
    mutations: List[str] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    collapsed: bool = False

# In-memory session storage (no persistence - thematic!)
_sessions: Dict[str, SessionState] = {}

# Entropy increments
ENTROPY_RETRY = 0.1
ENTROPY_LOW_CONFIDENCE = 0.15
ENTROPY_PARTIAL_BODY = 0.1
ENTROPY_DETECTION_FAILURE = 0.2

# Collapse threshold
COLLAPSE_ATTEMPTS = 5
MAX_ENTROPY = 1.0


def create_session() -> str:
    """Create new session with fresh entropy state."""
    session_id = str(uuid.uuid4())[:8]
    _sessions[session_id] = SessionState()
    return session_id


def get_session(session_id: str) -> Optional[SessionState]:
    """Get session state, create if doesn't exist."""
    if session_id not in _sessions:
        _sessions[session_id] = SessionState()
    return _sessions[session_id]


def add_entropy(session_id: str, amount: float, reason: str) -> float:
    """Add entropy to session and log the mutation."""
    session = get_session(session_id)
    old_entropy = session.entropy
    session.entropy = min(MAX_ENTROPY, session.entropy + amount)
    session.mutations.append(f"[{reason}] +{amount:.2f} entropy ({old_entropy:.2f} → {session.entropy:.2f})")
    return session.entropy


def increment_attempt(session_id: str) -> int:
    """Increment attempt counter and add retry entropy."""
    session = get_session(session_id)
    session.attempts += 1
    add_entropy(session_id, ENTROPY_RETRY, "retry_attempt")
    
    # Check for collapse event
    if session.attempts >= COLLAPSE_ATTEMPTS and not session.collapsed:
        session.collapsed = True
        add_entropy(session_id, 0.3, "COLLAPSE_EVENT")
        session.mutations.append("⚠️ SYSTEM COLLAPSE TRIGGERED ⚠️")
    
    return session.attempts


def get_entropy_level(session_id: str) -> str:
    """Get human-readable entropy level."""
    session = get_session(session_id)
    e = session.entropy
    
    if e < 0.3:
        return "STABLE"
    elif e < 0.6:
        return "DEGRADING"
    elif e < 0.8:
        return "UNSTABLE"
    else:
        return "CRITICAL"


def should_apply_mutation(session_id: str, mutation_type: str) -> bool:
    """Check if a specific mutation should apply based on entropy."""
    session = get_session(session_id)
    e = session.entropy
    
    mutations = {
        "ignore_legs": e >= 0.3,
        "swap_joints": e >= 0.6,
        "random_weights": e >= 0.8,
        "dataset_shuffle": session.collapsed,
        "score_lies": e >= 0.5,
    }
    
    return mutations.get(mutation_type, False)


def get_collapse_warnings(session_id: str) -> List[str]:
    """Get fake system warnings based on entropy level."""
    session = get_session(session_id)
    warnings = []
    
    if session.entropy >= 0.3:
        warnings.append("Minor calibration drift detected")
    if session.entropy >= 0.5:
        warnings.append("Pose memory fragmentation: 23%")
    if session.entropy >= 0.7:
        warnings.append("WARNING: Neural pathway degradation")
    if session.collapsed:
        warnings.append("⚠️ CRITICAL: System stability compromised")
        warnings.append("Memory sectors corrupted: 7/12")
    
    return warnings


def get_session_stats(session_id: str) -> dict:
    """Get full session statistics for API response."""
    session = get_session(session_id)
    
    return {
        "session_id": session_id,
        "entropy": round(session.entropy, 3),
        "entropy_level": get_entropy_level(session_id),
        "attempts": session.attempts,
        "collapsed": session.collapsed,
        "mutations": session.mutations[-5:],  # Last 5 mutations
        "warnings": get_collapse_warnings(session_id),
        "system_unstable": session.entropy >= 0.6
    }
