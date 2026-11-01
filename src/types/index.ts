// Types shared across the entire ApkaNeta app

export type Tier = 'local' | 'state' | 'national'

export type PromiseStatus = 'delivered' | 'inProgress' | 'underReview' | 'notStarted'

export type TenderStatus = 'floated' | 'awarded' | 'wip' | 'completed' | 'delayed'

export type FundType = 'departmental' | 'mlalad' | 'mplad'

export interface LocationState {
  state: string | null
  district: string | null
  tehsil: string | null
  city: string | null
}

export interface RepFunds {
  scheme: string
  allocated_inr: number
  sanctioned_inr: number
  disbursed_inr: number
}

export interface Promise {
  id: string
  title: string
  category: string
  status: PromiseStatus
  evidence: string | null
  source_url: string | null
}

export interface MyNetaProfile {
  profile_url: string
  criminal_cases: number
  declared_assets_inr: number
  declared_liabilities_inr: number
  education: string
  age: number
  source_label: string
}

export interface Representative {
  id: string
  name: string
  tier: Tier
  designation: string
  constituency: string
  party: string
  party_color: string
  term_start: string
  term_end: string
  photo_url: string
  contact: {
    office: string
    phone: string | null
    email: string | null
  }
  funds: RepFunds
  myneta?: MyNetaProfile
  promises: Promise[]
}

export interface Tender {
  id: string
  title: string
  department: string
  authority_id?: 'bida' | 'riico' | 'nagar-parishad' | 'rspcb' | string
  fund_type: FundType
  fund_label: string
  amount_inr: number
  contractor_name: string
  contractor_id: string
  awarded_date: string
  target_date: string
  status: TenderStatus
  ward: number | null
  category: string
  source_url: string | null
}

export interface Authority {
  id: string
  name: string
  short_name: string
  full_name: string
  type: string
  icon: string
  badge_color: string
  head_official: {
    designation: string
    name: string
    office: string
    phone: string
    email?: string
  }
  jurisdiction_scope: string
  responsibilities: string[]
  tenders_count: number
  total_spend_inr: number
}

export interface Contractor {
  id: string
  name: string
  total_contracts: number
  total_value_inr: number
}

export interface CivicData {
  meta: {
    state: string
    state_slug: string
    district: string
    district_slug: string
    tehsil: string
    tehsil_slug: string
    city: string
    city_slug: string
    wards_count: number
  }
  representatives: Representative[]
  authorities?: Authority[]
  tenders: Tender[]
  contractors: Contractor[]
}
