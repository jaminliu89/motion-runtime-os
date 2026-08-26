from runtime.preference_learning import compile_preference_evidence
from runtime.style_selector import select


def director(fn='proof'):
    return {'segments':[{'id':'s1','start':0,'end':2,'narrative_function':fn,'attention_target':'x'}]}


def test_override_and_blind_vote_compile_to_bounded_prior():
    evidence=compile_preference_evidence([
        {'action':'override','patch':{'provenance':{'artDirectionProfile':'editorial_restraint'}}},
        {'vote':'winner','winner_profile':'editorial_restraint','weight':2},
        {'action':'reject','selected_profile':'kinetic_signal'},
    ],context_key='humanistic')
    assert evidence['sample_count']==3
    assert evidence['profile_bias']['editorial_restraint']>0
    assert evidence['profile_bias']['kinetic_signal']<0
    assert evidence['semantic_mutation_allowed'] is False


def test_learned_prior_can_break_weak_heuristic_but_not_explicit_preference():
    evidence=compile_preference_evidence([
        {'action':'prefer','preferred_profile':'editorial_restraint','weight':3},
        {'action':'prefer','preferred_profile':'editorial_restraint','weight':3},
        {'action':'reject','preferred_profile':'precision_tech','weight':2},
    ])
    learned=select({'content_type':'product','preference_evidence':evidence},director('setup'))
    assert learned['preference_evidence_applied'] is True
    explicit=select({'content_type':'product','preference_evidence':evidence,'preferred_profile':'precision_tech'},director('setup'))
    assert explicit['selected_profile']=='precision_tech'
    assert 'explicit_brand_preference' in explicit['reasons']


def test_invalid_and_non_style_events_are_ignored():
    evidence=compile_preference_evidence([{'action':'approve'},{'action':'override','patch':{'timelineStart':1.2}}])
    assert evidence['sample_count']==0
    assert len(evidence['ignored_events'])==2
